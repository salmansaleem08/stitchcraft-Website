import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1 className="logo">StitchCraft</h1>
          <nav className="main-nav">
            <a href="#home" className="nav-link">Home</a>
            <a href="#tailors" className="nav-link">Find Tailors</a>
            <a href="#materials" className="nav-link">Materials</a>
            <a href="#about" className="nav-link">About</a>
          </nav>
        </div>
      </header>
      <main className="main-content">
        <section className="hero-section">
          <div className="container">
            <h2 className="hero-title">Digital Tailoring Marketplace</h2>
            <p className="hero-subtitle">
              Connecting skilled artisans with customers across Pakistan
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">Find a Tailor</button>
              <button className="btn btn-secondary">Join as Tailor</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
