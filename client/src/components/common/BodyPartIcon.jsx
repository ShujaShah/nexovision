import { Brain, Heart, Bone, Eye, Ear, Activity, CircleDot, ActivitySquare } from 'lucide-react';

const getBodyPartIcon = (bodyPart, props) => {
  if (!bodyPart) return <Activity {...props} />;
  
  const normalized = bodyPart.toLowerCase();
  
  if (normalized.includes('brain') || normalized.includes('head') || normalized.includes('skull')) {
    return <Brain {...props} />;
  }
  if (normalized.includes('heart') || normalized.includes('cardiac')) {
    return <Heart {...props} />;
  }
  if (normalized.includes('bone') || normalized.includes('spine') || normalized.includes('knee') || normalized.includes('arm') || normalized.includes('leg') || normalized.includes('shoulder') || normalized.includes('pelvis') || normalized.includes('hip') || normalized.includes('neck')) {
    return <Bone {...props} />;
  }
  if (normalized.includes('eye') || normalized.includes('orbital')) {
    return <Eye {...props} />;
  }
  if (normalized.includes('ear')) {
    return <Ear {...props} />;
  }
  if (normalized.includes('chest') || normalized.includes('lung') || normalized.includes('thorax')) {
    return <Activity {...props} />;
  }
  if (normalized.includes('stomach') || normalized.includes('abdomen') || normalized.includes('liver') || normalized.includes('kidney') || normalized.includes('bowel') || normalized.includes('pelvic')) {
    return <CircleDot {...props} />;
  }
  
  return <Activity {...props} />; // Fallback
};

const BodyPartIcon = ({ bodyPart, size = 16, className = "" }) => {
  return getBodyPartIcon(bodyPart, { size, className });
};

export default BodyPartIcon;
