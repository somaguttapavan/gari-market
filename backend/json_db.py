import json
import os
import asyncio
from typing import List, Optional, Dict, Any

class JSONCollection:
    def __init__(self, name: str, file_path: str):
        self.name = name
        self.file_path = file_path

    def _load(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.file_path):
            return []
        try:
            with open(self.file_path, "r") as f:
                data = json.load(f)
                return data.get(self.name, [])
        except (json.JSONDecodeError, IOError):
            return []

    def _save(self, data: List[Dict[str, Any]]):
        all_data = {}
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r") as f:
                    all_data = json.load(f)
            except: pass
        
        all_data[self.name] = data
        with open(self.file_path, "w") as f:
            json.dump(all_data, f, indent=4)

    async def insert_one(self, document: Dict[str, Any]):
        data = self._load()
        # Mocking MongoDB behavior: remove any _id or handle objects
        data.append(document)
        self._save(data)
        return type('obj', (object,), {'inserted_id': 'mock_id'})

    async def find_one(self, filter: Dict[str, Any]):
        data = self._load()
        for doc in data:
            match = True
            for k, v in filter.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find(self, filter: Optional[Dict[str, Any]] = None):
        data = self._load()
        if not filter:
            results = data
        else:
            results = []
            for doc in data:
                match = True
                for k, v in filter.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    results.append(doc)
        
        # Return a mock cursor object with to_list
        class MockCursor:
            def __init__(self, results):
                self.results = results
            async def to_list(self, length=None):
                return self.results
            def __aiter__(self):
                return iter(self.results)
        
        return MockCursor(results)

    async def update_one(self, filter: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        data = self._load()
        found = False
        update_doc = update.get("$set", update)
        
        for i, doc in enumerate(data):
            match = True
            for k, v in filter.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                data[i].update(update_doc)
                found = True
                break
        
        if not found and upsert:
            new_doc = filter.copy()
            new_doc.update(update_doc)
            data.append(new_doc)
        
        self._save(data)
        return type('obj', (object,), {'modified_count': 1 if found else 0})

class JSONDatabase:
    def __init__(self, file_path: str = "db_fallback.json"):
        self.file_path = os.path.join(os.path.dirname(__file__), file_path)
        self._collections = {}

    def __getitem__(self, name: str):
        if name not in self._collections:
            self._collections[name] = JSONCollection(name, self.file_path)
        return self._collections[name]

    def get_collection(self, name: str):
        return self.__getitem__(name)
