import numpy as np
import random

# ============================
# Linear Regression Baseline
# ============================
def regression_green_time(model, input_features):
    """Baseline green time prediction using regression with guardrails"""
    raw_prediction = model.predict([input_features])[0]
    green_time = max(3.0, min(raw_prediction, 15.0))  # guardrails
    return green_time


# ============================
# Reinforcement Learning Agent
# ============================
class TrafficLightAgent:
    def __init__(self, n_states=50, n_actions=7, alpha=0.1, gamma=0.9, epsilon=0.2):
        """
        Q-learning traffic light agent
        - n_states: discretized number of cars
        - n_actions: possible adjustments to regression prediction
        - actions: [-3, -2, -1, 0, +1, +2, +3] seconds
        """
        self.actions = [-3, -2, -1, 0, 1, 2, 3]
        self.q_table = np.zeros((n_states, n_actions))
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.n_actions = n_actions

    def choose_action(self, state):
        # ε-greedy exploration
        if random.uniform(0, 1) < self.epsilon:
            return random.randint(0, self.n_actions - 1)
        return np.argmax(self.q_table[state])

    def update(self, state, action, reward, next_state):
        # Q-learning update
        best_next = np.max(self.q_table[next_state])
        self.q_table[state, action] += self.alpha * (
            reward + self.gamma * best_next - self.q_table[state, action]
        )


# ============================
# Hybrid Predictor
# ============================
def hybrid_green_time(model, agent, input_features):
    """
    Hybrid predictor:
    - If <=1 vehicle -> fixed safe green time
    - If >1 vehicles -> regression + RL adjustment
    """
    total_cars = int(input_features[0])  # assume first feature is car count

    # Case 1: very few cars -> fixed green
    if total_cars <= 1:
        return 5.0, None, None

    # Case 2: regression + RL
    base_time = regression_green_time(model, input_features)

    # State for RL = discretized total demand
    state = min(total_cars, 49)

    # RL chooses adjustment
    action_idx = agent.choose_action(state)
    adjustment = agent.actions[action_idx]

    # Combine baseline + adjustment
    green_time = base_time + adjustment

    # Guardrails again
    green_time = max(3.0, min(green_time, 15.0))

    return green_time, state, action_idx


# ============================
# Reward Function
# ============================
def compute_reward(ns_demand, ew_demand, green_time, direction="NS"):
    """
    Reward = cars cleared - cars still waiting
    Assumption: 1 car passes per 2 seconds of green
    """
    if direction == "NS":
        cleared = min(ns_demand, green_time // 2)
        waiting = ns_demand - cleared
    else:
        cleared = min(ew_demand, green_time // 2)
        waiting = ew_demand - cleared

    reward = cleared - waiting
    return reward


# ============================
# Training Simulation
# ============================
class DummyModel:
    """Fake regression model just for demonstration"""
    def predict(self, X):
        return [min(15, max(3, 0.5 * X[0][0] + 5))]  # simple formula


if __name__ == "__main__":
    model = DummyModel()
    agent = TrafficLightAgent()

    for episode in range(100):  # simulate 100 cycles
        ns_demand = random.randint(0, 25)
        ew_demand = random.randint(0, 25)
        input_features = [ns_demand + ew_demand]

        # Hybrid decision
        green_time, state, action_idx = hybrid_green_time(model, agent, input_features)

        # If green_time came from RL (not fixed case)
        if state is not None:
            reward = compute_reward(ns_demand, ew_demand, green_time, direction="NS")
            next_state = min((ns_demand + ew_demand) // 2, 49)
            agent.update(state, action_idx, reward, next_state)

        print(
            f"Ep {episode+1}: NS={ns_demand}, EW={ew_demand}, Green={green_time:.1f}s"
        )
