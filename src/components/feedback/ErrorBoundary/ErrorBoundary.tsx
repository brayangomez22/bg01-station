import { Component, type ReactNode } from 'react';
import { ErrorState } from '@/components/feedback/ErrorState/ErrorState';

interface Props {
  children: ReactNode;
  /** Resets the boundary when this value changes (e.g. route pathname). */
  resetKey?: string;
}

interface State {
  hasError: boolean;
}

/** Catches render/lazy-load errors and shows a themed, retryable fallback. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorState onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
