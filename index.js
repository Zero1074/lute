Copyconst qrcode = require('qrcode-terminal');

const text = 'whatsapp://send?phone=1234567890';
qrcode.generate(text, { small: true });
