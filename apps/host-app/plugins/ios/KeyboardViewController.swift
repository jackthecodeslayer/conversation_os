import UIKit

struct AppItem {
    let name: String
    let emoji: String
    let url: String
}

class AppCell: UICollectionViewCell {
    let iconLabel = UILabel()
    let titleLabel = UILabel()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        
        contentView.backgroundColor = .systemBackground
        contentView.layer.cornerRadius = 16
        contentView.layer.cornerCurve = .continuous
        contentView.layer.shadowColor = UIColor.black.cgColor
        contentView.layer.shadowOpacity = 0.05
        contentView.layer.shadowOffset = CGSize(width: 0, height: 1)
        contentView.layer.shadowRadius = 2
        
        iconLabel.font = UIFont.systemFont(ofSize: 32)
        iconLabel.textAlignment = .center
        iconLabel.translatesAutoresizingMaskIntoConstraints = false
        
        titleLabel.font = UIFont.systemFont(ofSize: 11, weight: .medium)
        titleLabel.textColor = .label
        titleLabel.textAlignment = .center
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        contentView.addSubview(iconLabel)
        contentView.addSubview(titleLabel)
        
        NSLayoutConstraint.activate([
            iconLabel.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            iconLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor, constant: -8),
            
            titleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 2),
            titleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -2),
            titleLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -8)
        ])
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

class KeyboardViewController: UIInputViewController, UICollectionViewDataSource, UICollectionViewDelegate {
    
    var collectionView: UICollectionView!
    let apps: [AppItem] = [
        AppItem(name: "Tic-Tac", emoji: "🎮", url: "https://cvos-backend.onrender.com/game/tictactoe/123"),
        AppItem(name: "Words", emoji: "📝", url: "https://cvos-backend.onrender.com/game/words/123"),
        AppItem(name: "Cards", emoji: "🧠", url: "https://cvos-backend.onrender.com/game/flashcards/123"),
        AppItem(name: "Poll", emoji: "📊", url: "https://cvos-backend.onrender.com/game/poll/123")
    ]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // 1. Native Blur Background (Chameleon)
        let blurEffect = UIBlurEffect(style: .systemChromeMaterial)
        let blurView = UIVisualEffectView(effect: blurEffect)
        blurView.frame = self.view.bounds
        blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        self.view.addSubview(blurView)
        
        // 2. Setup Top Bar (Scheduled Button)
        let scheduledButton = UIButton(type: .system)
        scheduledButton.setTitle(" ⏰ Scheduled: 'Happy Bday!' ", for: .normal)
        scheduledButton.titleLabel?.font = UIFont.systemFont(ofSize: 13, weight: .semibold)
        scheduledButton.backgroundColor = UIColor.systemBlue.withAlphaComponent(0.1)
        scheduledButton.setTitleColor(.systemBlue, for: .normal)
        scheduledButton.layer.cornerRadius = 14
        scheduledButton.layer.cornerCurve = .continuous
        scheduledButton.translatesAutoresizingMaskIntoConstraints = false
        scheduledButton.addTarget(self, action: #selector(injectScheduledMessage), for: .touchUpInside)
        self.view.addSubview(scheduledButton)
        
        // 3. Setup Horizontal App Drawer (UICollectionView)
        let layout = UICollectionViewFlowLayout()
        layout.scrollDirection = .horizontal
        layout.itemSize = CGSize(width: 70, height: 75)
        layout.minimumLineSpacing = 15
        layout.sectionInset = UIEdgeInsets(top: 0, left: 15, bottom: 0, right: 15)
        
        collectionView = UICollectionView(frame: .zero, collectionViewLayout: layout)
        collectionView.backgroundColor = .clear
        collectionView.showsHorizontalScrollIndicator = false
        collectionView.dataSource = self
        collectionView.delegate = self
        collectionView.register(AppCell.self, forCellWithReuseIdentifier: "AppCell")
        collectionView.translatesAutoresizingMaskIntoConstraints = false
        self.view.addSubview(collectionView)
        
        // 4. Layout Constraints
        NSLayoutConstraint.activate([
            scheduledButton.topAnchor.constraint(equalTo: self.view.topAnchor, constant: 10),
            scheduledButton.leadingAnchor.constraint(equalTo: self.view.leadingAnchor, constant: 15),
            scheduledButton.heightAnchor.constraint(equalToConstant: 28),
            
            collectionView.topAnchor.constraint(equalTo: scheduledButton.bottomAnchor, constant: 15),
            collectionView.leadingAnchor.constraint(equalTo: self.view.leadingAnchor),
            collectionView.trailingAnchor.constraint(equalTo: self.view.trailingAnchor),
            collectionView.heightAnchor.constraint(equalToConstant: 90)
        ])
    }
    
    // MARK: - UICollectionViewDataSource
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return apps.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "AppCell", for: indexPath) as! AppCell
        let app = apps[indexPath.row]
        cell.iconLabel.text = app.emoji
        cell.titleLabel.text = app.name
        return cell
    }
    
    // MARK: - UICollectionViewDelegate
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let app = apps[indexPath.row]
        let proxy = self.textDocumentProxy as UITextDocumentProxy
        proxy.insertText(app.url)
    }

    @objc func injectScheduledMessage() {
        let proxy = self.textDocumentProxy as UITextDocumentProxy
        let draftMessage = "Happy Birthday! Hope you have a great day 🎉"
        proxy.insertText(draftMessage)
    }
}
