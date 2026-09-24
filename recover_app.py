import json
import sys

transcript_path = r"C:\Users\HP\.gemini\antigravity-ide\brain\360300c2-5d6b-42b6-b0d7-fd5cdd330503\.system_generated\logs\transcript_full.jsonl"
target_files = {
    "App.tsx": "c:/Users/HP/Downloads/SIH 2026/atmosfusion-web/src/App.tsx"
}

recovered_contents = {k: None for k in target_files}

# Go backwards through the file to find the original creations
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            entry = json.loads(line)
            if entry.get("type") == "PLANNER_RESPONSE" and "tool_calls" in entry:
                for call in entry["tool_calls"]:
                    if call["name"] == "write_to_file":
                        args = call.get("args", {})
                        target = args.get("TargetFile", "")
                        for k, v in target_files.items():
                            if target == v and recovered_contents[k] is None:
                                recovered_contents[k] = args.get("CodeContent", "")
        except Exception as e:
            pass

for k, content in recovered_contents.items():
    if content:
        with open(target_files[k], 'w', encoding='utf-8') as out:
            out.write(content)
        print(f"Recovered {k}")
    else:
        print(f"Could not recover {k}")
