# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://vagrantcloud.com/search.
  config.vm.box = "ubuntu/xenial64"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # NOTE: This will enable public access to the opened port
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.network "forwarded_port", guest: 27017, host: 27017

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine and only allow access
  # via 127.0.0.1 to disable public access
  # config.vm.network "forwarded_port", guest: 80, host: 8080, host_ip: "127.0.0.1"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  config.vm.synced_folder "./data", "/home/ubuntu/data"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  # config.vm.provider "virtualbox" do |vb|
  #   # Display the VirtualBox GUI when booting the machine
  #   vb.gui = true
  #
  #   # Customize the amount of memory on the VM:
  #   vb.memory = "1024"
  # end
  #
  # View the documentation for the provider you are using for more
  # information on available options.

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", inline: <<-SHELL
    curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
    bash nodesource_setup.sh

    apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
    echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
    
    apt-get update

    apt-get -y install nodejs
    apt-get -y install build-essential
    
    apt-get -y install mongodb-org
    service mongod start
    sleep 2
    mongo admin --eval 'db.createUser({user: "boop", pwd: "LearnBoops", roles: [ {role: "userAdminAnyDatabase", db: "admin" }, { role: "readWrite", db: "learnboops" }]});'
    cp /home/ubuntu/data/mongod.conf /etc/mongod.conf
    service mongod restart

    echo "sudo service mongod start" >> /home/ubuntu/.bashrc

    apt-get -y install build-essential tcl

    pushd /tmp
    curl -O http://download.redis.io/redis-stable.tar.gz
    tar xzsf redis-stable.tar.gz
    cd redis-stable
    make -s
    make -s test
    make -s install
    popd

    mkdir /etc/redis
    cp /home/ubuntu/data/redis.conf /etc/redis/redis.conf
    cp /home/ubuntu/data/redis.service /etc/systemd/system/redis.service

    adduser --system --group --no-create-home redis
    mkdir /var/lib/redis
    chown redis:redis /var/lib/redis
    chmod 770 /var/lib/redis

    systemctl enable redis
    systemctl start redis

    pushd /home/ubuntu/data
    npm install body-parser --no-bin-links
    npm install escape-html --no-bin-links
    npm install express --no-bin-links
    npm install mongodb --no-bin-links
    npm install redis --no-bin-links
    popd

  SHELL
end