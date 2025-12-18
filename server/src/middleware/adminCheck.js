const adminCheck = (req, res, next) => {
    // req.user udah diisi sama authMiddleware sebelumnya
    if (req.user && req.user.role === 'ADMIN') {
        next(); // Silakan lewat bos
    } else {
        res.status(403).json({ error: "Access Denied! Khusus Sultan/Admin." });
    }
};

module.exports = adminCheck;