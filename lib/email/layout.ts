import { SITE_URL, SITE_NAME } from "@/lib/site";

const COLORS = {
  bg: "#e6ddce", // bone
  surface: "#f6f1e7",
  text: "#19171c", // soft-black
  mutedText: "#55505a",
  border: "#b6b0b7", // fog
  primary: "#fdb17a", // pumpkin-orange
  primaryText: "#19171c",
  secondary: "#a88bc1", // dusty-lavender
  headerBg: "#19171c", // soft-black
  headerText: "#e6ddce", // bone
};

const HEADING_FONT = "'Ultra', Georgia, 'Times New Roman', serif";

export function renderEmailLayout({
  previewText,
  eyebrow,
  heading,
  bodyHtml,
  ctaText,
  ctaHref,
}: {
  previewText: string;
  eyebrow?: string;
  heading: string;
  bodyHtml: string;
  ctaText?: string;
  ctaHref?: string;
}) {
  const siteHost = SITE_URL.replace(/^https?:\/\//, "");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${SITE_NAME}</title>
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css2?family=Ultra&display=swap" rel="stylesheet" />
    <!--<![endif]-->
  </head>
  <body style="margin:0; padding:0; background:${COLORS.bg}; font-family: Georgia, 'Times New Roman', serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="max-width:520px; background:${COLORS.surface}; border-radius:14px; overflow:hidden; border:1px solid ${COLORS.border};"
          >
            <tr>
              <td
                style="background:${COLORS.headerBg}; padding:22px 32px; border-bottom:3px dashed ${COLORS.primary};"
              >
                <span style="font-family:${HEADING_FONT}; font-size:20px; letter-spacing:0.02em; color:${COLORS.headerText};">
                  🎃 ${SITE_NAME} 🕸️
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 32px;">
                ${
                  eyebrow
                    ? `<span style="display:inline-block; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; background:${COLORS.secondary}; color:#ffffff; padding:4px 12px; border-radius:999px; margin-bottom:14px; font-family: Georgia, serif;">${eyebrow}</span><br />`
                    : ""
                }
                <h1 style="margin:0 0 16px; font-family:${HEADING_FONT}; font-weight:400; font-size:26px; line-height:1.3; color:${COLORS.text};">${heading}</h1>
                <div style="font-size:15px; line-height:1.6; color:${COLORS.text};">${bodyHtml}</div>
                ${
                  ctaText && ctaHref
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                        <tr>
                          <td style="border-radius:999px; background:${COLORS.primary};">
                            <a
                              href="${ctaHref}"
                              style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:700; color:${COLORS.primaryText}; text-decoration:none; border-radius:999px;"
                            >${ctaText}</a>
                          </td>
                        </tr>
                      </table>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; border-top:1px dashed ${COLORS.border};">
                <p style="margin:0; font-size:12px; color:${COLORS.mutedText};">
                  👻 ${SITE_NAME} · Halloween apparel &amp; home goods, cursed to look this good all season long<br />
                  <a href="${SITE_URL}" style="color:${COLORS.mutedText};">${siteHost}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
