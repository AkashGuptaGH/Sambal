const icons = require('lucide-react');
const targetIcons = ['IndianRupee', 'CloudLightning', 'Wind', 'ThermometerSun', 'Activity', 'ShieldCheck', 'Box', 'AlertTriangle', 'CheckCircle', 'MapPin', 'Calendar'];

for (let i of targetIcons) {
  if (!icons[i]) console.log('MISSING:', i);
}
console.log('DONE');
