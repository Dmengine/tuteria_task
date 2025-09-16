import { postToCdnPostmarkService } from "@/lib/postToCdn";

const OLD_FETCH = (global as any).fetch;

describe("postToCdnPostmarkService", () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn(async (url: string, opts: any) => {
      // simple fake success response
      return {
        status: 200,
        json: async () => ({ id: "mocked", url }),
      };
    });
  });

  afterEach(() => {
    (global as any).fetch = OLD_FETCH;
    jest.resetAllMocks();
  });

  it("posts to CDN endpoint and returns parsed json", async () => {
    const result = await postToCdnPostmarkService("/send-mail", { foo: "bar" }, { CDN_SERVICE: "https://cdn.example" });
    expect(result).toHaveProperty("id", "mocked");
  });
});
