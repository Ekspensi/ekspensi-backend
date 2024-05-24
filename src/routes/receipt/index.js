exports = async (server) => {
  server.route([
    {
      method: "GET",
      path: "/",
      handler: () => {
        return "Receipts!";
      },
    },
  ]);
};
