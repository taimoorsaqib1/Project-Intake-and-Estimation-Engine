const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

p.briefAnalysis
  .findMany({
    where: { status: "FAILED" },
    select: {
      id: true,
      briefId: true,
      status: true,
      errorMessage: true,
      rawResponse: true,
    },
  })
  .then((rows) => {
    console.log(JSON.stringify(rows, null, 2));
    return p.$disconnect();
  })
  .catch((e) => {
    console.error(e.message);
    return p.$disconnect();
  });
