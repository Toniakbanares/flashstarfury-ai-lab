import { Component, ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="min-h-dvh flex items-center justify-center px-6 text-center">
        <div className="max-w-md space-y-3">
          <h2 className="font-heading text-2xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground break-words">{this.state.error.message || "Unexpected error"}</p>
          <div className="flex gap-2 justify-center pt-2">
            <button onClick={this.reset} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Try again
            </button>
            <button onClick={() => (window.location.href = "/")} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
