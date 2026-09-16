/** Defense in depth: padrões conhecidos e nomes proibidos, não prova de ausência de segredos. */
export function inspectFile(path, content) {
  const findings = [];
  const name = path.replaceAll('\\', '/').split('/').at(-1) ?? '';
  if (
    (/^\.env(?:\.|$)/i.test(name) && name !== '.env.example') ||
    /\.(?:pem|key|p12|pfx)$/i.test(name) ||
    /service[-_]?account.*\.json$/i.test(name) ||
    /^(?:google-services\.json|GoogleService-Info\.plist)$/i.test(name)
  ) {
    findings.push('arquivo de credencial/configuração privada');
  }

  const patterns = [
    ['chave privada PEM', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/],
    ['service account', /["']type["']\s*:\s*["']service_account["']/],
    ['chave de API Google', /AIza[0-9A-Za-z_-]{35}/],
    ['token GitHub', /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})/],
    ['token Slack', /xox[baprs]-[A-Za-z0-9-]{20,}/],
    ['access key AWS', /(?:AKIA|ASIA)[A-Z0-9]{16}/],
    ['token JWT', /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
    ['credencial em URL', /https?:\/\/[^\s/@:]+:[^\s/@]+@/],
    [
      'segredo literal',
      /["']?(?:client[_-]?secret|password|access[_-]?token|refresh[_-]?token)["']?\s*[:=]\s*["'][^"'\r\n]{12,}["']/i,
    ],
  ];
  for (const [label, expression] of patterns) {
    if (expression.test(content)) findings.push(label);
  }
  return findings;
}
