# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.hostname = "blog-box"

  config.vm.provision "shell", inline: <<-SCRIPT
    sudo apt-get install git -y
    sudo apt-get install inotify-tools -y
    sudo apt-get install nodejs -y
    sudo ln -s /usr/bin/nodejs /usr/bin/node
    git clone https://github.com/kvalle/dotfiles.git
SCRIPT

  config.vm.network "forwarded_port", guest: 4321, host: 4321
  config.vm.synced_folder "", "/home/vagrant/blog"
  config.vm.synced_folder "../writings", "/home/vagrant/writings"
end
