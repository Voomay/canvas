export interface Party {
  id: 'da' | 'anc' | 'pa';
  name: string;
  fullName: string;
  slogan: string;
  colorHex: string;
  colorNum: number;
  textColor: string;
  accentColor: number;
  candidateName: string;
  candidateTitle: string;
  bio: string;
  specialTrait: string;
}

export const PARTIES: Record<'da' | 'anc' | 'pa', Party> = {
  da: {
    id: 'da',
    name: 'DA',
    fullName: 'Democratic Alliance',
    slogan: 'Canvassing with spreadsheets & crisp clipboards!',
    colorHex: '#005ba6',
    colorNum: 0x005ba6,
    textColor: '#ffffff',
    accentColor: 0x38a8ff,
    candidateName: '',
    candidateTitle: 'Official Campaign Trail',
    bio: 'Armed with crisp campaign flyers, energetic strides, and blue running takkies.',
    specialTrait: '+5% higher promise credibility with sceptical voters.'
  },
  anc: {
    id: 'anc',
    name: 'ANC',
    fullName: 'African National Congress',
    slogan: 'Historic rallies, warm handshakes & big visions!',
    colorHex: '#fcb813',
    colorNum: 0xfcb813,
    textColor: '#0c1524',
    accentColor: 0x007a3d,
    candidateName: '',
    candidateTitle: 'Official Campaign Trail',
    bio: 'Masters the art of warm greetings, historic rhetoric, and spirited community talks.',
    specialTrait: '+5% higher resilience when discussing tough complaints.'
  },
  pa: {
    id: 'pa',
    name: 'PA',
    fullName: 'Patriotic Alliance',
    slogan: 'Straight talking, bold swagger & immediate action!',
    colorHex: '#1e6b38',
    colorNum: 0x1e6b38,
    textColor: '#ffffff',
    accentColor: 0xf5a623,
    candidateName: '',
    candidateTitle: 'Official Campaign Trail',
    bio: 'Straight talking, bold swagger, ready to roll up sleeves and tell it like it is.',
    specialTrait: '+5% higher boost when delivering comically honest answers.'
  }
};
