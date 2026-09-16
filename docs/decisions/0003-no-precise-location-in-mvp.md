# ADR 0003 — Ausência de localização precisa no MVP

Status: aceito. Contexto: perseguição e triangulação podem ocorrer mesmo com distâncias arredondadas.

Decisão: não coletar/processar/armazenar GPS, coordenadas, geohash, bairro, endereço ou localização precisa. Sem permissões de localização, SDK de mapas ou campos privados de coordenadas. Descoberta futura usa cidade declarada de catálogo. Fotos precisam perder EXIF/GPS antes de exibição.

Alternativa: coordenadas privadas e distância calculada no servidor. Rejeitada para o MVP por necessidade insuficiente e risco residual.

Consequências: sem ranking de distância; nova decisão e testes antitriangulação antes de qualquer aproximação geográfica futura. Jogos também permanecem fora do MVP.
