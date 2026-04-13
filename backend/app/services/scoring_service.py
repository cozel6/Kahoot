"""Easy formula to calculate the score of a player based on their answer and the time taken to answer."""

BASE_POINTS = 1000

def calulate_points(
        is_correct: bool,
        elapsed_ms: int,
        time_limit_ms: int
) -> int:
    """Based on Kahoot's scoring system
    - Wrong answers get 0 points
    - Correct answers -> between 500 - 1000 points, depending on how fast the player answered
      points = BASE_POINTS * (1 - 0.5 * elapsed / limit)
    Instant answers get 1000 points 
    Limit response get 500 points
    """
    if not is_correct:
        return 0
    if time_limit_ms <= 0:
        return BASE_POINTS

    ratio = max(0.0, min(1.0, elapsed_ms / time_limit_ms))
    points = BASE_POINTS * (1 - 0.5 * ratio)
    return round(points)