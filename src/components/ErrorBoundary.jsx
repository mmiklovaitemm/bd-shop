import { Component } from "react";

/**
 * App-wide error boundary.
 *
 * Without this, any render/commit-phase throw (e.g. a transient framer-motion
 * animation error) unmounts the entire React tree, leaving a permanent white
 * screen: client-side routing is dead, so the browser Back button loads nothing
 * and only a full page reload recovers. This catches such errors and shows a
 * recoverable fallback instead.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Keep a trace in the console for debugging in production.
    console.error("App crashed:", error, info);
  }

  handleReload = () => {
    // Reset the boundary first; if the tree renders cleanly we recover in place,
    // otherwise a hard reload guarantees a clean state.
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            color: "#111",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ opacity: 0.7, maxWidth: "28rem" }}>
            An unexpected error occurred. Please reload the page to continue.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              padding: "0.6rem 1.4rem",
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
