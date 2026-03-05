import os
import re
import requests
import time

def get_bot_servers(token):
    if not token:
        return 0
    headers = {"Authorization": f"Bot {token}"}
    servers = 0
    after = "0"
    while True:
        try:
            resp = requests.get(f"https://discord.com/api/v10/users/@me/guilds?limit=200&after={after}", headers=headers)
            if resp.status_code == 429:
                time.sleep(resp.json().get('retry_after', 1))
                continue
            if resp.status_code != 200:
                print(f"Error fetching guilds: {resp.status_code} {resp.text}")
                break
            data = resp.json()
            if not data:
                break
            servers += len(data)
            after = data[-1]["id"]
            if len(data) < 200:
                break
        except Exception as e:
            print(f"Error fetching: {e}")
            break
    return servers

def update_html(servers, users, shards):
    file_path = "index.html"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Update Server Count
    content = re.sub(
        r'id="server-count">.*?<',
        f'id="server-count">{servers:,}+<',
        content
    )
    # Update User Count
    user_str = f"{users/1000:.0f}k+" if users >= 1000 else str(users)
    content = re.sub(
        r'id="user-count">.*?<',
        f'id="user-count">{user_str}<',
        content
    )
    # Update Shard Count
    content = re.sub(
        r'id="shard-count">.*?<',
        f'id="shard-count">{shards}<',
        content
    )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    axion_token = os.getenv("AXION_TOKEN")
    meloxi_token = os.getenv("MELOXI_TOKEN")

    total_servers = 0
    
    if axion_token:
        print("Fetching Axion servers...")
        total_servers += get_bot_servers(axion_token)
    
    if meloxi_token:
        print("Fetching Meloxi servers...")
        total_servers += get_bot_servers(meloxi_token)

    if not axion_token and not meloxi_token:
        print("Tokens missing, cannot fetch live data. Exiting.")
        exit(1)

    # Estimate users based on previous ratio (~486 users per server) or adjust as needed
    total_users = int(total_servers * 486)
    
    # Estimate shards or use static if preferred
    total_shards = 16 if total_servers < 16000 else (total_servers // 1000 + 1)

    print(f"Live Stats Retrieved: {total_servers} servers, ~{total_users} users, {total_shards} shards")
    update_html(total_servers, total_users, total_shards)
    print("Stats updated successfully!")
