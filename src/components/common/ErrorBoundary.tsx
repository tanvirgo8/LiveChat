'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React runtime error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 p-6 text-center select-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20 shadow-xl">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-white">Something went wrong</h1>
          <p className="mt-1.5 max-w-sm text-xs text-slate-400">
            An unexpected error occurred in the application. Please try reloading the page to restore your session.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-indigo-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
