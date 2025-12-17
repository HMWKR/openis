import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Production logging - send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Here you would typically send to a logging service like Sentry
      // For now, we'll just log essential info without sensitive data
      const errorLog = {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'), // Limited stack trace
        componentStack: errorInfo.componentStack?.split('\n').slice(0, 5).join('\n'),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // In production, this would be sent to a logging endpoint
      console.error('[ErrorBoundary] Application Error:', errorLog);
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6">
          <div className="bg-stone-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-stone-700">
            <div className="w-20 h-20 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>

            <h1 className="text-2xl font-bold text-stone-100 mb-3">
              문제가 발생했습니다
            </h1>

            <p className="text-stone-400 text-lg mb-8 leading-relaxed">
              앱에서 예상치 못한 오류가 발생했습니다.
              <br />
              잠시 후 다시 시도해 주세요.
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xl font-bold transition-all duration-200 active:scale-95"
              >
                <RefreshCw className="w-6 h-6" />
                다시 시도
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-2xl text-xl font-bold transition-all duration-200 active:scale-95"
              >
                <Home className="w-6 h-6" />
                처음으로
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mt-6 p-4 bg-stone-900 rounded-xl text-left">
                <p className="text-red-400 text-sm font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
