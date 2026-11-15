"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * High-End Resilient Section Boundary
 * Isolates runtime failures to a single section so the rest of the site never crashes.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[SectionErrorBoundary] Section "${this.props.sectionName || "Unknown"}" recovered from error:`,
        error,
        errorInfo
      );
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Graceful degraded state: returns null so other sections render seamlessly
      return null;
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;

