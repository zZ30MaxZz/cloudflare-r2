export const uploadFile = async (file: File) => {
    try {
        // Step 1: Get the pre-signed URL
        const res = await fetch('http://localhost:5032/generate-upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
            }),
        });

        if (!res.ok) {
            throw new Error('Failed to get upload URL');
        }

        const { url, fileName } = await res.json();

        // Step 2: Upload the file to the pre-signed URL
        const uploadRes = await fetch(url, {
            method: 'PUT',
            headers: {
                "Content-Type": file.type || "application/octet-stream",
            },
            body: file,
        });

        if (!uploadRes.ok) {
            throw new Error('Failed to upload file');
        }

        return { success: true, url, fileName };
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: true, url: null, fileName: null };
    }
};