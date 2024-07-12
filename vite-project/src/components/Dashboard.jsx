import Card from './Card';

function Dashboard() {
  return (
    <main className="dashboard">
      <h2>Dashboard</h2>
      <div className="cards">
        <Card title="Teste" content="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quos ipsa soluta obcaecati corrupti beatae hic aliquid quas distinctio eligendi asperiores dolore veritatis blanditiis impedit, debitis quaerat illum qui at dicta."/>
        <Card title="Carta 2" content="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quos ipsa soluta obcaecati corrupti beatae hic aliquid quas distinctio eligendi asperiores dolore veritatis blanditiis impedit, debitis quaerat illum qui at dicta." />
        <Card title="Carta 4" content="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quos ipsa soluta obcaecati corrupti beatae hic aliquid quas distinctio eligendi asperiores dolore veritatis blanditiis impedit, debitis quaerat illum qui at dicta." />
      </div>
    </main>
  );
}

export default Dashboard;
