import React, { useCallback, useEffect, useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { useParams } from 'react-router'
import { io } from "socket.io-client"
function Texteditor() {


    const { id: documentId } = useParams();
    const [socket, setsocket] = useState();
    const [quill, setQuill] = useState();
    const SAVE_INTERVAL_MS = 2000
    //Tool bar configuration
    const TOOLBAR_OPTIONS = [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["bold", "italic", "underline"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ align: [] }],
        ["image", "blockquote", "code-block"],
        ["clean"],
    ]

    useEffect(() => {
        const s = io("https://alledit.onrender.com")
        setsocket(s);

        return () => {
            s.disconnect()
        }
    }, [])
    useEffect(() => {
        if (socket == null || quill == null) {
            return;
        }
        const textchanger = (delta, olddelta, source) => {
            if (source != "user") {
                return;
            }
            socket.emit('send-change', delta);
        }

        quill.on('text-change', textchanger);
        return () => {
            quill.off('text-change', textchanger);

        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) {
            return;
        }
        const recievechanger = (delta) => {
            quill.updateContents(delta)
        }

        socket.on('recieve-change', recievechanger);
        return () => {
            socket.off('recieve-change', recievechanger);

        }
    }, [socket, quill])



    useEffect(() => {
        if (socket == null || quill == null) return

        socket.once("load-document", data => {

            quill.setContents(data)
            quill.enable()
        })

        socket.emit("get-document", documentId)
    }, [socket, quill, documentId])



    useEffect(() => {
        if (socket == null || quill == null) return

        const interval = setInterval(() => {
            socket.emit("save-document", quill.getContents())
        }, SAVE_INTERVAL_MS)

        return () => {
            clearInterval(interval)
        }
    }, [socket, quill])


    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return

        wrapper.innerHTML = ""
        const editor = document.createElement("div")
        wrapper.append(editor)
        const q = new Quill(editor, {
            theme: "snow",
            modules: { toolbar: TOOLBAR_OPTIONS }
        })
        q.disable();
        q.setText("loading")
        setQuill(q)
    }, [])
    return (
        <div className="container" ref={wrapperRef}></div>
    )
}

export default Texteditor