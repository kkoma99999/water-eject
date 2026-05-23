interface JsonLdProps {
  data: object;
}

// Characters that need escaping inside a <script> tag. JSON.stringify alone
// does NOT escape "<", so a string containing "</script>" would terminate the
// tag. U+2028 and U+2029 are valid in JSON strings but illegal in JS source —
// they crash inline scripts.
const UNSAFE_CODES = new Set([0x3c, 0x3e, 0x26, 0x2028, 0x2029]);

function safeStringify(data: object): string {
  const json = JSON.stringify(data);
  let out = "";
  for (const ch of json) {
    const code = ch.codePointAt(0);
    if (code !== undefined && UNSAFE_CODES.has(code)) {
      out += "\\u" + code.toString(16).padStart(4, "0");
    } else {
      out += ch;
    }
  }
  return out;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeStringify(data) }}
    />
  );
}
