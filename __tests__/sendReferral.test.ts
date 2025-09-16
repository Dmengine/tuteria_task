import { sendMail } from "@/lib/mail";
import nodemailer from "nodemailer";

jest.mock("nodemailer");

describe("sendMail", () => {
  const mockSendMail = jest.fn().mockResolvedValue({ messageId: "test-id" });

  beforeAll(() => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });
    process.env.SMTP_HOST = "smtp.test.com";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_USER = "user@test.com";
    process.env.SMTP_PASS = "pass";
    process.env.SMTP_FROM = "from@test.com";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("sends an email with correct parameters", async () => {
    const result = await sendMail({
      to: "to@test.com",
      subject: "Test Subject",
      html: "<b>Hello</b>",
    });

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: "smtp.test.com",
      port: 465,
      secure: true,
      auth: {
        user: "user@test.com",
        pass: "pass",
      },
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: "from@test.com",
      to: "to@test.com",
      subject: "Test Subject",
      html: "<b>Hello</b>",
    });

    expect(result).toHaveProperty("messageId", "test-id");
  });

  it("throws and logs error if sending fails", async () => {
    mockSendMail.mockRejectedValueOnce(new Error("fail!"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await expect(
      sendMail({
        to: "to@test.com",
        subject: "fail",
        html: "<b>fail</b>",
      })
    ).rejects.toThrow("fail!");

    expect(consoleSpy).toHaveBeenCalledWith("[sendMail] Error:", expect.any(Error));
    consoleSpy.mockRestore();
  });
});