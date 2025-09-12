import random
import heapq
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import networkx as nx
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder

# -----------------------------
# 1. TRAIN AI MODEL FOR SIGNAL TIMINGS
# -----------------------------
def generate_training_data(n=1000):
    data = []
    for _ in range(n):
        time_of_day = random.choice(["morning", "afternoon", "evening", "night"])
        vehicles = random.randint(5, 60)
        foot_traffic = random.randint(0, 30)
        weather = random.choice(["sunny", "rainy"])
        event_nearby = random.choice([0, 1])
        emergency_vehicle = random.choice([0, 1])
        green_time = (
            vehicles * 0.8 +
            foot_traffic * 0.5 +
            (10 if weather == "rainy" else 0) +
            (20 if event_nearby else 0) +
            (30 if emergency_vehicle else 0)
        )
        green_time += random.randint(-5, 5)
        data.append([
            time_of_day, vehicles, foot_traffic, weather,
            event_nearby, emergency_vehicle, green_time
        ])
    df = pd.DataFrame(data, columns=[
        "time_of_day", "vehicles", "foot_traffic", "weather",
        "event_nearby", "emergency_vehicle", "green_time"
    ])
    return df

def train_signal_model():
    df = generate_training_data(1000)
    le_time = LabelEncoder()
    df["time_encoded"] = le_time.fit_transform(df["time_of_day"])
    le_weather = LabelEncoder()
    df["weather_encoded"] = le_weather.fit_transform(df["weather"])
    X = df[["time_encoded", "vehicles", "foot_traffic",
            "weather_encoded", "event_nearby", "emergency_vehicle"]]
    y = df["green_time"]
    model = LinearRegression()
    model.fit(X, y)
    return model, le_time, le_weather, df

model, le_time, le_weather, training_data = train_signal_model()

def predict_green_time(time_of_day, vehicles, foot_traffic, weather, event, emergency):
    time_enc = le_time.transform([time_of_day])[0]
    weather_enc = le_weather.transform([weather])[0]
    features = [[time_enc, vehicles, foot_traffic, weather_enc, event, emergency]]
    prediction = model.predict(features)[0]
    return max(5, round(prediction, 2))

# -----------------------------
# 2. DIJKSTRA FOR ROUTE
# -----------------------------
def dijkstra(graph, start, end):
    queue = [(0, start, [])]
    seen = set()
    while queue:
        cost, node, path = heapq.heappop(queue)
        if node in seen:
            continue
        path = path + [node]
        seen.add(node)
        if node == end:
            return cost, path
        for next_node, weight in graph.get(node, {}).items():
            if next_node not in seen:
                heapq.heappush(queue, (cost + weight, next_node, path))
    return float("inf"), []

# -----------------------------
# 3. VISUALIZATION FUNCTIONS
# -----------------------------
def plot_training_data(df):
    plt.figure(figsize=(12, 5))
    sns.scatterplot(data=df, x="vehicles", y="green_time", hue="weather", style="event_nearby")
    plt.title("Green Light Time vs Vehicles & Weather")
    plt.show()
    
def plot_signal_predictions(predictions):
    signals = list(predictions.keys())
    times = list(predictions.values())
    colors = ['green' if t < 40 else 'orange' if t < 70 else 'red' for t in times]
    plt.figure(figsize=(8, 4))
    sns.barplot(x=signals, y=times, palette=colors)
    plt.ylabel("Predicted Green Time (sec)")
    plt.title("Traffic Signal Predictions")
    plt.show()

def plot_city_graph(graph, path=None):
    G = nx.Graph()
    for node, edges in graph.items():
        for dest, weight in edges.items():
            G.add_edge(node, dest, weight=weight)
    pos = nx.spring_layout(G)
    nx.draw(G, pos, with_labels=True, node_color='skyblue', node_size=1000)
    nx.draw_networkx_edge_labels(G, pos, edge_labels=nx.get_edge_attributes(G,'weight'))
    if path:
        nx.draw_networkx_nodes(G, pos, nodelist=path, node_color='orange', node_size=1200)
        nx.draw_networkx_edges(G, pos, edgelist=list(zip(path, path[1:])), edge_color='orange', width=3)
    plt.show()

# -----------------------------
# 4. INTERACTIVE DEMO
# -----------------------------
if __name__ == "__main__":
    # Show training data
    print("\n📊 Training Data Sample:")
    print(training_data.head())
    plot_training_data(training_data)
    
    # Predict signals interactively
    traffic_signals = {
        "Signal A": {"time": "morning", "vehicles": 30, "foot": 10, "weather": "sunny", "event": 0, "emergency": 0},
        "Signal B": {"time": "evening", "vehicles": 50, "foot": 20, "weather": "rainy", "event": 1, "emergency": 0},
        "Signal C": {"time": "night", "vehicles": 15, "foot": 2, "weather": "sunny", "event": 0, "emergency": 1},
    }
    
    predictions = {}
    print("\n🔵 Predicted Signal Timings:")
    for signal, factors in traffic_signals.items():
        duration = predict_green_time(
            factors["time"], factors["vehicles"], factors["foot"],
            factors["weather"], factors["event"], factors["emergency"]
        )
        predictions[signal] = duration
        print(f"{signal} → {duration} seconds")
    
    plot_signal_predictions(predictions)
    
    # Suggest path
    city_graph = {"A": {"B": 5, "C": 10}, "B": {"A": 5, "D": 2}, "C": {"A": 10, "D": 1}, "D": {"B": 2, "C": 1}}
    cost, path = dijkstra(city_graph, "A", "D")
    print("\n🟢 Suggested Path:")
    print(f"Best route from A → D: {path} (congestion score {cost})")
    plot_city_graph(city_graph, path)
