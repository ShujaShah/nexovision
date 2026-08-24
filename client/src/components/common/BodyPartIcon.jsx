import { FaBrain, FaHeart, FaBone, FaEye, FaEarListen, FaTooth, FaLungs } from 'react-icons/fa6';
import { GiStomach, GiKidneys, GiLiver } from 'react-icons/gi';
import { Activity } from 'lucide-react';

const getBodyPartIcon = (bodyPart, props) => {
  if (!bodyPart) return <Activity {...props} />;
  
  const normalized = bodyPart.toLowerCase();
  
  if (normalized.includes('brain') || normalized.includes('head') || normalized.includes('skull')) {
    return <FaBrain {...props} />;
  }
  if (normalized.includes('tooth') || normalized.includes('teeth') || normalized.includes('dental')) {
    return <FaTooth {...props} />;
  }
  if (normalized.includes('heart') || normalized.includes('cardiac')) {
    return <FaHeart {...props} />;
  }
  if (normalized.includes('bone') || normalized.includes('spine') || normalized.includes('knee') || normalized.includes('arm') || normalized.includes('leg') || normalized.includes('shoulder') || normalized.includes('pelvis') || normalized.includes('hip') || normalized.includes('neck')) {
    return <FaBone {...props} />;
  }
  if (normalized.includes('eye') || normalized.includes('orbital')) {
    return <FaEye {...props} />;
  }
  if (normalized.includes('ear')) {
    return <FaEarListen {...props} />;
  }
  if (normalized.includes('chest') || normalized.includes('lung') || normalized.includes('thorax')) {
    return <FaLungs {...props} />;
  }
  if (normalized.includes('stomach') || normalized.includes('abdomen') || normalized.includes('bowel')) {
    return <GiStomach {...props} />;
  }
  if (normalized.includes('kidney') || normalized.includes('renal')) {
    return <GiKidneys {...props} />;
  }
  if (normalized.includes('liver') || normalized.includes('hepatic')) {
    return <GiLiver {...props} />;
  }
  
  return <Activity {...props} />; // Fallback
};

const BodyPartIcon = ({ bodyPart, size = 16, className = "" }) => {
  // Map size to react-icons props pattern (using string or number)
  return getBodyPartIcon(bodyPart, { size, className });
};

export default BodyPartIcon;
