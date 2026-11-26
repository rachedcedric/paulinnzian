import assert from "node:assert/strict";
import test from "node:test";
import { classifyVisit, deviceFromUserAgent, isBot, isWhatsAppHost } from "../src/lib/site-stats";

const own = "paulinnzian.com";

test("classifyVisit reads the referrer", () => {
  assert.equal(classifyVisit("https://www.google.ci/", "", own).source, "google");
  assert.equal(classifyVisit("https://l.facebook.com/l.php?u=x", "", own).source, "facebook");
  assert.equal(classifyVisit("https://www.tiktok.com/", "", own).source, "tiktok");
  assert.equal(classifyVisit("android-app://com.instagram.android", "", own).source, "instagram");
  const other = classifyVisit("https://blog.example.org/post", "", own);
  assert.deepEqual([other.source, other.referrerHost], ["other", "blog.example.org"]);
});

test("classifyVisit treats no referrer and the site itself as direct", () => {
  assert.equal(classifyVisit("", "", own).source, "direct");
  assert.equal(classifyVisit("https://www.paulinnzian.com/tarifs", "", own).source, "direct");
  assert.equal(classifyVisit("not a url", "", own).source, "direct");
});

test("classifyVisit prefers campaign tags and click ids", () => {
  const tagged = classifyVisit("", "?utm_source=WA&utm_medium=statut&utm_campaign=Promo-Noel", own);
  assert.deepEqual(
    [tagged.source, tagged.utmMedium, tagged.utmCampaign],
    ["whatsapp", "statut", "promo-noel"],
  );
  assert.equal(classifyVisit("https://facebook.com/", "utm_source=fb&utm_medium=cpc", own).source, "facebook-ads");
  assert.equal(classifyVisit("", "?gclid=abc", own).source, "google-ads");
  assert.equal(classifyVisit("", "?ttclid=abc", own).source, "tiktok-ads");
  assert.equal(classifyVisit("", "?fbclid=abc", own).source, "facebook");
  assert.equal(classifyVisit("", "?utm_source=Ma Newsletter!", own).source, "ma-newsletter");
});

test("device, bot and WhatsApp helpers", () => {
  assert.equal(deviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"), "mobile");
  assert.equal(deviceFromUserAgent("Mozilla/5.0 (Linux; Android 14; SM-X200) Safari"), "tablet");
  assert.equal(deviceFromUserAgent("Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari"), "mobile");
  assert.equal(deviceFromUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0)"), "desktop");
  assert.equal(isBot("WhatsApp/2.24.1 A"), true);
  assert.equal(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)"), true);
  assert.equal(isBot(""), true);
  assert.equal(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"), false);
  assert.equal(isWhatsAppHost("wa.me"), true);
  assert.equal(isWhatsAppHost("chat.whatsapp.com"), true);
  assert.equal(isWhatsAppHost("temu.to"), false);
});
