import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { TodoUpdate } from '../models/TodoUpdate'
import { v4 as uuid } from 'uuid'

// Create logger instance
const logger = createLogger('TodosAccess')

// Create AttachmentUtils and TodosAccess instances
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

/**
 * Creates a new todo item.
 * @param newTodo The todo item to create.
 * @param userId The ID of the user creating the todo item.
 * @returns The created todo item.
 */
export async function createTodo(
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('Create todo function called')

  // Generate a new UUID for the todo item
  const todoId = uuid()

  // Get the current date and time
  const createdAt = new Date().toISOString()

  // Create a new todo item with the given properties
  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUrl: null,
    ...newTodo
  }

  // Create the todo item and return it
  return await todosAccess.createTodoItem(newItem)
}

/**
 * Gets all todo items for the given user ID.
 * @param userId The ID of the user to get todo items for.
 * @returns An array of todo items for the given user ID.
 */
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Get todos for user function called')

  // Get all todo items for the given user ID and return them
  return todosAccess.getAllTodos(userId)
}

/**
 * Updates an existing todo item.
 * @param todoId The ID of the todo item to update.
 * @param todoUpdate The update to apply to the todo item.
 * @param userId The ID of the user updating the todo item.
 * @returns The updated todo item.
 */
export async function updateTodo(
  todoId: string,
  todoUpdate: UpdateTodoRequest,
  userId: string
): Promise<TodoUpdate> {
  logger.info('Update todo function')

  // Update the todo item with the given ID and return it
  return await todosAccess.updateTodoItem(todoId, userId, todoUpdate)
}

/**
 * Deletes an existing todo item.
 * @param todoId The ID of the todo item to delete.
 * @param userId The ID of the user deleting the todo item.
 * @returns A message indicating that the todo item was deleted.
 */
export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<string> {
  logger.info('Delete todo function called')

  // Delete the todo item with the given ID and return a message
  return todosAccess.deleteTodoItem(todoId, userId)
}

/**
 * Generates a pre-signed URL for uploading an attachment to a todo item.
 * @param attachmentId The ID of the attachment item to generate the URL for.
 * @returns The pre-signed URL for uploading an attachment to the todo item.
 */
export async function createAttachmentPresignedUrl(
  attachmentId: string,
): Promise<string> {
  try {
    const uploadUrl = attachmentUtils.getUploadUrl(attachmentId)
    logger.info(`Presigned Url is generated: ${uploadUrl}`)
    return uploadUrl
  } catch (error) {
    const errorMsg = 'Error occurred when generating presigned Url to upload'
    logger.error(errorMsg)
    // return new CustomError(errorMsg, 500)
  }
  // logger.info('Create attachment function called by user', userId, todoId)
  // return attachmentUtils.getUploadUrl(todoId)
}

/**
 * Update attachment url
 *
 */
export async function updateAttachmentUrl(
  userId: string,
  todoId: string,
  attachmentId: string
): Promise<void> {
  try {
    // Generate an S3 attachment URL for the todo item
    const s3AttachmentUrl = await attachmentUtils.getAttachmentUrl(attachmentId);


    await todosAccess.updateTodoAttachmentUrl(todoId, userId, s3AttachmentUrl);

    logger.info(`Updating todo ${todoId} with attachment URL ${s3AttachmentUrl}`, {
      userId,
      todoId,
    });

  } catch (error) {
    logger.error('Error occurred when updating todo item attachment URL', { error });
    throw error;
  }
}

