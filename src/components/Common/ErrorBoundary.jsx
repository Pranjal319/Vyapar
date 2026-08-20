import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[VYAPAR ErrorBoundary Caught Error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="vyapar-error-boundary-screen" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0f1520',
          color: '#e9c46a',
          fontFamily: '"Cinzel", serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f4a261' }}>
            📜 VYAPAR REALM RECOVERY
          </h1>
          <p style={{ maxWidth: '600px', color: '#e07a5f', fontFamily: 'monospace', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)', padding: '0.8rem', borderRadius: '4px', marginTop: '1rem', wordBreak: 'break-all' }}>
            {this.state.error?.message || String(this.state.error)}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              marginTop: '1.5rem',
              backgroundColor: '#f4a261',
              color: '#0f1520',
              border: 'none',
              padding: '0.75rem 1.8rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 RESTORE JOURNEY
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
