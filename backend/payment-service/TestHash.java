import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.MessageDigest;
import java.util.UUID;

public class TestHash {
    private static String md5(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hash = md.digest(input.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public static void main(String[] args) throws Exception {
        String merchantId = "1234081";
        String merchantSecret = "MzU4MDMxMDY0OTM3NzQ4NzAwMjYxNzU1MTc0MjI5MjY1NDQz";
        String orderId = "EF-12345678";
        BigDecimal amountDecimal = new BigDecimal("50");
        String amount = amountDecimal.setScale(2, RoundingMode.HALF_UP).toPlainString();
        String currency = "LKR";

        String secretMd5 = md5(merchantSecret).toUpperCase();
        String raw = merchantId + orderId + amount + currency + secretMd5;
        String finalHash = md5(raw).toUpperCase();

        System.out.println("Amount: " + amount);
        System.out.println("Secret MD5 Upper: " + secretMd5);
        System.out.println("Raw String: " + raw);
        System.out.println("Final Hash: " + finalHash);
    }
}
