    # 1st shell
    make dev

    # 2nd shell
    make parcel

    # 3rd shell
    cd parcel/vr/server/
    make serve

    open http://localhost:333/vr/proxy/proxy.html
    open http://localhost:333/vr/index.html?showControlPlanes=false
