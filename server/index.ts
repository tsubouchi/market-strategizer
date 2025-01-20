import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Process level error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Request logging middleware with detailed error information
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) {
      console.log(`${logLine} :: Response:`, JSON.stringify(capturedJsonResponse));
    } else {
      console.log(logLine);
    }
  });

  next();
});

async function startServer() {
  try {
    log("Initializing server...");
    const server = registerRoutes(app);

    // Error handling middleware with detailed logging
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        status: err.status || err.statusCode || 500
      });

      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ 
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
      });
    });

    const env = app.get("env");
    log(`Setting up server in ${env} mode`);

    if (env === "development") {
      log("Setting up Vite development server...");
      await setupVite(app, server);
    } else {
      log("Setting up static file serving...");
      serveStatic(app);
    }

    // Changed port to 8080 and added detailed startup logging
    const PORT = 8080;
    return new Promise((resolve, reject) => {
      server.listen(PORT, "0.0.0.0", () => {
        log(`Server is running on port ${PORT}`);
        log(`Environment: ${env}`);
        log(`API endpoint: http://localhost:${PORT}/api`);
        resolve(server);
      }).on('error', (error) => {
        console.error('Failed to start server:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    throw error;
  }
}

// Start the server with enhanced error handling
startServer().catch((error) => {
  console.error('Critical server error:', error);
  process.exit(1);
});