
const Home=()=>{

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6">ShortList</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="p-4 rounded-lg border border-border shadow-md bg-card"
          >
            <p className="font-semibold"></p>
            <p className="text-sm text-muted-foreground"></p>
          </div>
      </div>
    </div>
  );
}

export default Home;