const logoutUserController = async (req, res) => {
    try {
        // Clear the signed cookie
        res.clearCookie('token', {
            httpOnly: true,
            signed: true
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};

export default logoutUserController;