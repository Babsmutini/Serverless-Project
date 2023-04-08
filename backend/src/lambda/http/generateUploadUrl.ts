import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import {
  createAttachmentPresignedUrl,
  updateAttachmentUrl
} from '../../businessLogic/todos'
import { v4 as uuid } from 'uuid'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Upload image')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const attachmentId = uuid()

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    

    try {
      const uploadUrlRes = await createAttachmentPresignedUrl(attachmentId)

      await updateAttachmentUrl(userId, todoId, attachmentId)

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ uploadUrl: uploadUrlRes })
      }
    } catch (error) {
      logger.error('Error generating signed URL or updating attachment URL', {
        error
      })

      return {
        statusCode: error.statusCode || 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ msg: error.message })
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
