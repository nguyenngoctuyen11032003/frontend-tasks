"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    // Log to error reporting service in production
    this.logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Send to error reporting service (Sentry, LogRocket, etc.)
    console.error("Error logged:", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-xl">Đã xảy ra lỗi</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.props.showDetails && this.state.error && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium mb-2">Chi tiết lỗi:</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {this.state.error.message}
                  </p>
                  {process.env.NODE_ENV === "development" && this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium hover:underline">
                        Stack trace
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-40 text-muted-foreground">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Về trang chủ
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Nếu lỗi vẫn tiếp diễn, vui lòng liên hệ với bộ phận hỗ trợ
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
