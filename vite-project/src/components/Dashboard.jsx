import Card from './Card';

function Dashboard() {
  return (
    <main className="dashboard">
      <h2>Dashboard</h2>
      <div className="cards">
        <Card title="Card 1" content="This is some content for card 1." />
        <Card title="Card 2" content="This is some content for card 2." />
        <Card title="Card 3" content="This is some content for card 3." />
      </div>
    </main>
  );
}

export default Dashboard;
