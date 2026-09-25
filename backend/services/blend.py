from typing import Dict, List, Tuple
from pydantic import BaseModel

class BlendResult(BaseModel):
    consensus_blend: float
    simple_average: float
    disagreement_index: float
    p_heavy_rain: float
    p_very_heavy: float
    p_extremely_heavy: float

def compute_blend(predictions: Dict[str, float], weights: Dict[str, float]) -> BlendResult:
    # 2.1 The "blend" is weights x predictions
    consensus = sum(p * weights.get(m, 0) for m, p in predictions.items())
    
    # Simple average
    avg = sum(predictions.values()) / len(predictions) if predictions else 0
    
    # 3.6 Disagreement is max - min
    disagreement = max(predictions.values()) - min(predictions.values()) if predictions else 0
    
    # 2.3 Probabilities
    # Placeholder for a real distribution function, here we make them consistent with the blend
    # If consensus > threshold, we assign a higher probability, capping it properly.
    def get_prob(threshold: float) -> float:
        if consensus >= threshold:
            return min(0.99, 0.5 + (consensus - threshold) / threshold * 0.5)
        else:
            return max(0.01, (consensus / threshold) * 0.4)
            
    return BlendResult(
        consensus_blend=round(consensus, 1),
        simple_average=round(avg, 1),
        disagreement_index=round(disagreement, 1),
        p_heavy_rain=round(get_prob(64.5), 2),
        p_very_heavy=round(get_prob(115.6), 2),
        p_extremely_heavy=round(get_prob(204.5), 2),
    )
