import cv2
import threading
import base64
import numpy as np

class CameraStream:
    def __init__(self, source=0):  # 0 = kamera laptop
        self.cap = cv2.VideoCapture(source)
        self.frame = None
        self.running = False
        
    def start(self):
        self.running = True
        thread = threading.Thread(target=self._update)
        thread.daemon = True
        thread.start()
        
    def _update(self):
        while self.running:
            ret, frame = self.cap.read()
            if ret:
                self.frame = frame
                
    def get_frame_base64(self):
        if self.frame is None:
            return None
        _, buffer = cv2.imencode('.jpg', self.frame)
        return base64.b64encode(buffer).decode('utf-8')
    
    def stop(self):
        self.running = False
        self.cap.release()

camera = CameraStream(source=0)