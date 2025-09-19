import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary componentDidCatch:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const errorInfo = this.state.errorInfo;
      
      // Fallback UI with debugging info
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ff4444', 
          color: 'white', 
          fontFamily: 'monospace',
          minHeight: '100vh',
          overflow: 'auto'
        }}>
          <h1>🚨 React Error Boundary</h1>
          <h2>Error Details:</h2>
          <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            {error?.toString()}
          </pre>
          
          <h2>Stack Trace:</h2>
          <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>
            {error?.stack}
          </pre>
          
          {errorInfo && (
            <>
              <h2>Component Stack:</h2>
              <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>
                {errorInfo.componentStack}
              </pre>
            </>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            🔄 Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;