import requests
from Scratch import Scratch
import re
import os
import time
import scratchattach as scratch3


class Scratch:

  def __init__(self, projectId, userName, password):
    self.projectId = projectId
    self.userName = userName

    self.connection = scratch3.login(
        userName, password).connect_cloud(project_id=self.projectId)

  @staticmethod
  def request(url):
    try:
      response = requests.get(url)
      if response.status_code == 200:
        return response.json()
      else:
        print("API call failed with status code:", response.status_code)
        return None
    except Exception as e:
      print("An error occurred:", e)
      return None
    time.sleep(1)

  def getVariable(self, name):

    def find_index_of_string_in_names(json_data, search_string):
      # JSONデータをPythonオブジェクトに変換
      data = json_data
      # 名前のリストを取得
      names = [item['name'] for item in data if 'name' in item]
      # 名前のリスト内で検索文字列を探す
      for index, name in enumerate(names):
        if search_string in name:
          return index
      # 見つからなかった場合
      return -1

    # Scratch APIのエンドポイントURL
    api_endpoint = f'https://clouddata.scratch.mit.edu/logs?projectid={self.projectId}&limit=100&offset=0&scope=project&key=&format=json&name={name}'

    data = Scratch.request(api_endpoint)
    index = find_index_of_string_in_names(data, "☁ " + name)
    if data:
      if index == -1:
        return None

      variable_value = data[index]['value']
      return variable_value

    time.sleep(0.2)

  def setVariable(self, name, value):
    if self.connection is not None:
      self.connection.set_var(name, value)
      time.sleep(0.2)


def encode(txt):
  return "".join([
      str(
          list(
              "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%#$-_.+!*'(),;/?:@=&~\|"
          ).index(c) + 1).zfill(2) for c in txt
  ])


def decode(txt):
  return "".join([
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%#$-_.+!*'(),;/?:@=&~\|"[
          int(c) - 1] for c in re.split('(..)', txt)[1::2]
  ])


scratch = Scratch.Scratch(996841387, os.environ['USER_NAME'],
                          os.environ['PASSWORD'])


def main():
  if scratch.getVariable("connect").startswith("01"):

    short_url = scratch.getVariable("connect")[2:]
    API_KEY = os.environ['API_KEY']
    print(short_url)
    short_url = decode(short_url)

    url = f"https://xgd.io/V1/shorten?url={short_url}&key={API_KEY}"

    response = requests.get(url).json()

    print(response)

    if response["status"] == 200:
      print(response["shorturl"])
      shortURL = response["shorturl"]

      scratch.setVariable("connect", str(encode(shortURL)))
    else:
      print(f"Error: {response['status']}")
      scratch.setVariable("connect", "03" + str(response["status"]))
  time.sleep(3)


main()
