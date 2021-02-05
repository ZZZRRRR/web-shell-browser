import sh

error = {"error":" "}

def start1(usrID, proID):
    try:
        sh.mkdir("/home/"+usrID)
        sh.chmod("777","/home/"+usrID)
        sh.docker("run","-itd","-v","/home/"+usrID+":/home/"+usrID,"--name",proID + usrID, proID)#创建容器
        sh.docker("exec",proID + usrID,'service','ssh','start')#容器开启ssh服务
        #以下为返回容器id，用户id，容器ip的操作
        containerID = str(sh.docker("inspect","-f","{{.Config.Hostname}}",proID + usrID)).replace('\n','').replace('\r','')
        containerIP = str(sh.docker("inspect","-f","{{.NetworkSettings.IPAddress}}",proID + usrID)).replace('\n','').replace('\r','')
        return {'containerID':containerID,'containerIP': containerIP}
    except Exception as e:
        error["error"] = str(e)
        return error

#用户非第一次开始：
def start2(usrID,proID):
    try:
        sh.docker("start", proID + usrID)#创建容器
        sh.docker("exec",proID + usrID,'service','ssh','start')#容器开启ssh服务
        #以下为返回容器id，用户id，容器ip的操作
        containerID = str(sh.docker("inspect","-f","{{.Config.Hostname}}",proID + usrID)).replace('\n','').replace('\r','')
        containerIP = str(sh.docker("inspect","-f","{{.NetworkSettings.IPAddress}}",proID + usrID)).replace('\n','').replace('\r','')
        return {'containerID':containerID,'containerIP': containerIP}
    except Exception as e:
        error["error"] = str(e)
        # print(error)
        return error

#用户退出实验，弹出是否保存按钮时
#选择是：
def exit1(usrID,proID):
    try:
        sh.docker("stop",proID + usrID)     #关闭容器
        return {"status" : "succeed"}
    except Exception as e:
        error["error"] = str(e)
        # print(error)
        return error


#选择否：
def exit2(usrID,proID):
    try:
        sh.docker("stop",proID + usrID)
        sh.docker("rm",proID + usrID)       #关闭并删除容器
        sh.rm("-rf","/home/"+usrID)
        return {"status" : "succeed"}
    except Exception as e:
        error["error"] = str(e)
        # print(error)
        return error
