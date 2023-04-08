import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStorage logic

const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = 300

export class AttachmentUtils{
	constructor(
		private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
		private readonly bucketName = s3BucketName
	){}

	getAttachmentUrl(attachmentId: string){
		return `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`
	}

	getUploadUrl(attachmentId: string): string{
		const url = this.s3.getSignedUrl('putObject', {
			Bucket: this.bucketName,
			Key: attachmentId,
			Expires: urlExpiration
		})
		return url as string
	}
}
