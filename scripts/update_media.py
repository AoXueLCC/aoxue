# -*- coding: utf-8 -*-
"""更新 data.json: 填充 20 辆车 gallery/video + 新增 t21 福田奥铃速运 + bump version.json"""
import json, os, time

BASE = r"C:\Users\win10\Desktop\reefer-quote-vue\public\data"
DATA = os.path.join(BASE, "data.json")

# 文件名(无扩展) -> 车型id  —— 图片
img_map = {
    "E路达宽体加强版": "t09", "吉利远程F1E": "t11", "吉利远程F1E地库版": "t12",
    "吉利远程F1E智运版": "t16", "吉利远程H8E": "t13", "吉利远程T9E": "t17",
    "吉利远程V6EP": "t14", "吉利远程V8E": "t15", "奇瑞开瑞X3": "t19",
    "奇瑞开瑞X7": "t20", "奇瑞零米尊享版": "t18", "欧曼GTL星翼": "t04",
    "欧曼行星": "t03", "江铃E路达": "t06", "江铃E顺达窄体": "t08",
    "江铃VAN卡": "t05", "江铃VAN面包": "t07", "江铃凯运宽体4D30": "t10",
    "福田奥铃M卡": "t01", "福田奥铃智蓝": "t02", "福田奥铃速运": "t21",
}
# 视频文件名 -> 车型id（测试阶段只放 t15 吉利远程V8E）
vid_map = {
    "吉利远程V8E": "t15",
}

d = json.load(open(DATA, encoding="utf-8"))

# 已有文件里的真实文件名检查
images_dir = os.path.join(BASE, "images")
videos_dir = os.path.join(BASE, "videos")
have_img = {f.split(".")[0] for f in os.listdir(images_dir)}
have_vid = {f.split(".")[0] for f in os.listdir(videos_dir)}
print("图片文件:", sorted(have_img))
print("视频文件:", sorted(have_vid))

for t in d["trucks"]:
    tid = t["id"]
    # gallery: 该车型的所有匹配图片
    gals = [tid + ".webp" for tid2, tid3 in img_map.items() if tid3 == tid]
    t["gallery"] = ["data/images/" + g for g in gals]
    # video: 该车型的匹配视频
    vids = [tid + ".mp4" for tid2, tid3 in vid_map.items() if tid3 == tid]
    t["video"] = "data/videos/" + vids[0] if vids else ""

# 新增 t21 福田奥铃速运（Excel 无参数，基础车）
existing_ids = {t["id"] for t in d["trucks"]}
if "t21" not in existing_ids:
    d["trucks"].append({
        "id": "t21",
        "brandId": "foton",
        "brand": "福田",
        "name": "福田奥铃速运",
        "truckType": "轻卡",
        "energy": "燃油",
        "engine": "—",
        "power": "—",
        "emission": "国六",
        "wheelbase": "—",
        "gearbox": "—",
        "tire": "—",
        "cargoLen": "4.2米",
        "totalMass": "—",
        "payload": "—",
        "battery": "—",
        "tankVolume": "—",
        "price": 0,
        "defaultAC": "",
        "video": "",
        "tags": ["冷藏专用"],
        "gallery": ["data/images/t21.webp"],
        "description": "福田奥铃速运冷藏车。详细参数待补充。"
    })
    print("已新增 t21 福田奥铃速运")
else:
    print("t21 已存在, 跳过新增")

# bump version
d["version"] = int(d["version"]) + 1
d["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())

json.dump(d, open(DATA, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
json.dump({"v": d["version"]}, open(os.path.join(BASE, "version.json"), "w", encoding="utf-8"), ensure_ascii=False)
print(f"完成: version -> {d['version']}")

# 校验输出
for t in d["trucks"]:
    print(t["id"], "|", t["name"], "| gallery:", len(t["gallery"]), "| video:", t["video"] or "(无)")
