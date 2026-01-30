import fs from 'fs/promises';

const fileDelete = async (filePath) => {
    try {
        await fs.unlink(filePath);
        console.log(`File at ${filePath} deleted successfully.`);
    }
    catch (error) {
        console.error(`Error deleting file at ${filePath}:`, error);
    }   
}

export default fileDelete;