import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

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
    console.error('[FreightIQ ErrorBoundary caught error]:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public handleResetSession = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#08193A] text-white">
          <div className="w-full max-w-md p-8 rounded-[32px] glass-panel-dark border border-white/20 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Workspace Recovery Active
              </h2>
              <p className="text-xs text-white/70 leading-relaxed">
                A telemetry render interruption was intercepted. Click below to resume your session or perform a clean start.
              </p>
              {this.state.error && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-rose-300 text-left max-h-24 overflow-y-auto">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
            </div>
            <div className="space-y-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Resume Operations</span>
              </button>
              <button
                onClick={this.handleResetSession}
                className="w-full py-2.5 rounded-full text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-emerald-300" />
                <span>Clear Cache & Fresh Start</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
