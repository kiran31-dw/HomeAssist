# Security Notes

## Known Vulnerabilities

The project uses `react-scripts` which has some known vulnerabilities in its development dependencies. These are:

1. **nth-check** (High) - Regular expression complexity issue in CSS selector parsing
2. **postcss** (Moderate) - Line return parsing error
3. **webpack-dev-server** (Moderate) - Source code exposure in development mode

### Important Notes:

- These vulnerabilities are **only in development dependencies** and do not affect production builds
- They are common in React projects using `react-scripts`
- The production build is safe to deploy
- Running `npm audit fix --force` will break the project (it tries to install react-scripts@0.0.0)

### Recommendations:

1. **For Development:** These vulnerabilities are acceptable as they only affect the development server
2. **For Production:** The production build (`npm run build`) does not include these vulnerable packages
3. **Future Updates:** Consider migrating to Vite or Next.js for better security and performance

### If You Need to Address Them:

1. **Update react-scripts** (may require React 18+):
   ```bash
   cd frontend
   npm install react-scripts@latest
   ```

2. **Or migrate to Vite** (recommended for new projects):
   - Better performance
   - More secure dependencies
   - Faster development experience

3. **For Production Deployment:**
   - Always use `npm run build` to create production builds
   - Production builds exclude development dependencies
   - Deploy only the `build/` folder, not `node_modules/`

## Backend Security

The backend uses:
- ✅ **bcryptjs** for password hashing (secure)
- ✅ **JWT** for authentication (secure)
- ✅ **Parameterized queries** (SQL injection protection)
- ✅ **Input validation** with express-validator
- ✅ **CORS** configuration

### Best Practices:

1. **Change default admin password** in production
2. **Use strong JWT_SECRET** (at least 32 characters)
3. **Enable HTTPS** in production
4. **Use environment variables** for all secrets
5. **Regular security updates** for npm packages
6. **Database backups** regularly

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly rather than opening a public issue.
