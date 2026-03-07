"""File storage service using S3."""

import logging
import uuid
from datetime import datetime
from typing import Optional, BinaryIO
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageService:
    """File storage service for uploads."""

    def __init__(self):
        self.s3_client: Optional[boto3.client] = None
        self.bucket_name = settings.S3_BUCKET_NAME

        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION,
            )

    def _generate_key(self, organization_id: str, folder: str, filename: str) -> str:
        """Generate a unique S3 key for the file."""
        ext = Path(filename).suffix
        unique_id = uuid.uuid4().hex[:8]
        date_prefix = datetime.utcnow().strftime("%Y/%m/%d")
        return f"{organization_id}/{folder}/{date_prefix}/{unique_id}{ext}"

    async def upload_file(
        self,
        file: BinaryIO,
        filename: str,
        organization_id: str,
        folder: str = "documents",
        content_type: Optional[str] = None,
    ) -> Optional[str]:
        """Upload a file to S3.

        Args:
            file: File-like object to upload
            filename: Original filename
            organization_id: Organization ID for namespacing
            folder: Folder within the organization (e.g., 'documents', 'photos')
            content_type: MIME type of the file

        Returns:
            S3 key of the uploaded file, or None if upload failed
        """
        if not self.s3_client:
            logger.warning("S3 not configured, skipping upload")
            return None

        key = self._generate_key(organization_id, folder, filename)

        try:
            extra_args = {}
            if content_type:
                extra_args["ContentType"] = content_type

            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                key,
                ExtraArgs=extra_args,
            )

            logger.info(f"Uploaded file to s3://{self.bucket_name}/{key}")
            return key

        except ClientError as e:
            logger.error(f"Failed to upload file: {e}")
            return None

    async def get_presigned_url(
        self,
        key: str,
        expiration: int = 3600,
    ) -> Optional[str]:
        """Get a presigned URL for downloading a file.

        Args:
            key: S3 key of the file
            expiration: URL expiration time in seconds (default: 1 hour)

        Returns:
            Presigned URL, or None if generation failed
        """
        if not self.s3_client:
            logger.warning("S3 not configured")
            return None

        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expiration,
            )
            return url

        except ClientError as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            return None

    async def delete_file(self, key: str) -> bool:
        """Delete a file from S3.

        Args:
            key: S3 key of the file

        Returns:
            True if deletion was successful
        """
        if not self.s3_client:
            logger.warning("S3 not configured")
            return False

        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            logger.info(f"Deleted file s3://{self.bucket_name}/{key}")
            return True

        except ClientError as e:
            logger.error(f"Failed to delete file: {e}")
            return False

    async def list_files(
        self,
        organization_id: str,
        folder: str = "",
        prefix: str = "",
    ) -> list[dict]:
        """List files in a folder.

        Args:
            organization_id: Organization ID
            folder: Folder to list (optional)
            prefix: Additional prefix filter (optional)

        Returns:
            List of file info dicts with 'key', 'size', 'last_modified'
        """
        if not self.s3_client:
            logger.warning("S3 not configured")
            return []

        full_prefix = f"{organization_id}/"
        if folder:
            full_prefix += f"{folder}/"
        if prefix:
            full_prefix += prefix

        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=full_prefix,
            )

            files = []
            for obj in response.get("Contents", []):
                files.append({
                    "key": obj["Key"],
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"].isoformat(),
                })

            return files

        except ClientError as e:
            logger.error(f"Failed to list files: {e}")
            return []


# Singleton instance
storage_service = StorageService()
